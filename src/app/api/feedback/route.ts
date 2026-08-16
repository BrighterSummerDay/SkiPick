import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseClient, isSupabaseConfigured, type FeedbackRecord } from "@/lib/supabase";

// 内存中降级备选（当未配置 Supabase 环境变量时提供流畅体验）
let fallbackFeedbacks: FeedbackRecord[] = [
  {
    id: "demo-1",
    nickname: "滑雪爱好者小张",
    content: "网站页面做得很漂亮！希望能加上苗场雪场的早鸟票对比。",
    resort_slug: null,
    ip_hash: "demo-hash",
    admin_reply: "感谢支持！26-27雪季早鸟票信息目前正在整理中，敬请期待更新！",
    replied_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip || "127.0.0.1").digest("hex");
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

// ── GET: 获取留言列表（支持 10 条/页 分页） ──────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
    const resortSlug = searchParams.get("resortSlug");

    if (!isSupabaseConfigured()) {
      let filtered = fallbackFeedbacks;
      if (resortSlug) {
        filtered = filtered.filter((f) => f.resort_slug === resortSlug);
      }
      const totalCount = filtered.length;
      const totalPages = Math.ceil(totalCount / pageSize) || 1;
      const from = (page - 1) * pageSize;
      const items = filtered.slice(from, from + pageSize);

      return NextResponse.json({
        isConfigured: false,
        items,
        totalCount,
        totalPages,
        page,
        pageSize,
      });
    }

    const supabase = getSupabaseClient()!;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("feedbacks")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (resortSlug) {
      query = query.eq("resort_slug", resortSlug);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return NextResponse.json({
      isConfigured: true,
      items: data || [],
      totalCount,
      totalPages,
      page,
      pageSize,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── POST: 提交留言（带 IP SHA-256 哈希 & 5 分钟限频） ──────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nickname, content, resortSlug } = body || {};

    const cleanNickname = String(nickname || "").trim();
    const cleanContent = String(content || "").trim();

    if (!cleanNickname || cleanNickname.length < 1 || cleanNickname.length > 30) {
      return NextResponse.json(
        { error: "请填写 1-30 个字符的昵称" },
        { status: 400 }
      );
    }

    if (!cleanContent || cleanContent.length < 1 || cleanContent.length > 1000) {
      return NextResponse.json(
        { error: "请填写 1-1000 个字符的留言内容" },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    if (!isSupabaseConfigured()) {
      // 本地降级：检查内存中 5 分钟限频
      const recent = fallbackFeedbacks.find(
        (f) => f.ip_hash === ipHash && f.created_at > fiveMinutesAgo
      );
      if (recent) {
        return NextResponse.json(
          { error: "留言太频繁了，请 5 分钟后再试" },
          { status: 429 }
        );
      }

      const newRecord: FeedbackRecord = {
        id: "demo-" + Date.now(),
        nickname: cleanNickname,
        content: cleanContent,
        resort_slug: resortSlug || null,
        ip_hash: ipHash,
        admin_reply: null,
        replied_at: null,
        created_at: new Date().toISOString(),
      };
      fallbackFeedbacks.unshift(newRecord);

      return NextResponse.json({ success: true, item: newRecord, isConfigured: false });
    }

    const supabase = getSupabaseClient()!;

    // 数据库校验 5 分钟同一 IP 限频
    const { data: recentFeedbacks, error: checkError } = await supabase
      .from("feedbacks")
      .select("id")
      .eq("ip_hash", ipHash)
      .gte("created_at", fiveMinutesAgo)
      .limit(1);

    if (checkError) {
      console.error("Rate limit check error:", checkError);
    } else if (recentFeedbacks && recentFeedbacks.length > 0) {
      return NextResponse.json(
        { error: "留言太频繁了，请 5 分钟后再试" },
        { status: 429 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("feedbacks")
      .insert([
        {
          nickname: cleanNickname,
          content: cleanContent,
          resort_slug: resortSlug || null,
          ip_hash: ipHash,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data, isConfigured: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── PATCH: 管理员回复留言 ──────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    const adminKeyHeader = req.headers.get("x-admin-key");
    const expectedKey = process.env.ADMIN_SECRET_KEY || "skipick_admin_2026";

    if (!adminKeyHeader || adminKeyHeader !== expectedKey) {
      return NextResponse.json({ error: "管理员秘钥验证失败" }, { status: 401 });
    }

    const body = await req.json();
    const { feedbackId, replyContent } = body || {};

    const cleanReply = String(replyContent || "").trim();
    if (!feedbackId) {
      return NextResponse.json({ error: "缺少留言 ID" }, { status: 400 });
    }

    if (!cleanReply) {
      return NextResponse.json({ error: "回复内容不能为空" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (!isSupabaseConfigured()) {
      const target = fallbackFeedbacks.find((f) => f.id === feedbackId);
      if (target) {
        target.admin_reply = cleanReply;
        target.replied_at = now;
      }
      return NextResponse.json({ success: true, item: target, isConfigured: false });
    }

    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from("feedbacks")
      .update({
        admin_reply: cleanReply,
        replied_at: now,
      })
      .eq("id", feedbackId)
      .select()
      .single();

    if (error) {
      console.error("Supabase reply update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data, isConfigured: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

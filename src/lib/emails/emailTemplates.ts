export function buildEmailTemplate(data: any) {
  const header = data.header || {};
  const topics = data.topics || [];

  const title = header.title || "";
  const subtitle = header.subtitle || "";
  const introduction = header.introduction || "";

  // Build topics HTML
  const topicsHtml = topics
    .map((t: any) => {
      const articles = (t.articles || [])
        .map(
          (a: any) => `
            <div style="margin-bottom:12px;">
              <a href="${a.url}" style="color:#1a73e8; font-weight:bold; text-decoration:none;">
                ${a.title}
              </a>
              <p style="margin:4px 0; font-size:14px; color:#555;">
                ${a.summary}
              </p>
            </div>
          `
        )
        .join("");

      return `
        <div style="margin-top:24px;">
          <h2 style="margin:0; color:#222; font-size:20px;">${t.topic}</h2>
          <p style="font-size:15px; color:#555; margin-top:6px;">
            ${t.summary}
          </p>
          ${articles}
        </div>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial, sans-serif; background:#f8f8f8; padding:24px;">
      <div style="max-width:600px; margin:auto; background:#fff; padding:32px; border-radius:10px;">

        <h1 style="margin:0; font-size:26px; text-align:center; color:#111;">
          ${title}
        </h1>

        <h3 style="margin:10px 0 20px; text-align:center; color:#666;">
          ${subtitle}
        </h3>

        <p style="font-size:16px; line-height:1.6; color:#333;">
          ${introduction}
        </p>

        ${topicsHtml}

        <hr style="margin-top:30px; border:0; border-top:1px solid #eee;" />

        <p style="text-align:center; color:#aaa; font-size:12px; margin-top:20px;">
          Powered by <strong>TAMDAN</strong> — Smarter news, curated for you.
        </p>

      </div>
    </div>
  `;
}

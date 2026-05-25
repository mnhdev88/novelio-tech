<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap — Novelio Technologies</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f4f6fb;
            color: #1e293b;
            min-height: 100vh;
          }

          header {
            background: #1B3172;
            padding: 28px 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
          }

          header h1 {
            color: #fff;
            font-size: 1.25rem;
            font-weight: 700;
            letter-spacing: -0.01em;
          }

          header p {
            color: rgba(255,255,255,0.65);
            font-size: 0.85rem;
            margin-top: 4px;
          }

          .badge {
            background: rgba(255,255,255,0.12);
            color: #fff;
            font-size: 0.8rem;
            padding: 6px 14px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.2);
          }

          main {
            max-width: 900px;
            margin: 40px auto;
            padding: 0 24px 60px;
          }

          .section-title {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
            margin: 36px 0 10px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          }

          thead tr {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }

          th {
            text-align: left;
            padding: 12px 18px;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #94a3b8;
          }

          td {
            padding: 13px 18px;
            font-size: 0.875rem;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }

          tr:last-child td { border-bottom: none; }

          tr:hover td { background: #f8faff; }

          a {
            color: #1B3172;
            text-decoration: none;
            font-weight: 500;
          }

          a:hover { text-decoration: underline; color: #6B3FA0; }

          .priority {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 0.78rem;
            font-weight: 600;
          }

          .p-high   { background: #dcfce7; color: #15803d; }
          .p-mid    { background: #fef9c3; color: #a16207; }
          .p-low    { background: #f1f5f9; color: #64748b; }

          .freq {
            color: #64748b;
            font-size: 0.82rem;
          }

          .date {
            color: #94a3b8;
            font-size: 0.82rem;
            white-space: nowrap;
          }

          footer {
            text-align: center;
            font-size: 0.78rem;
            color: #94a3b8;
            margin-top: 48px;
          }
        </style>
      </head>
      <body>
        <header>
          <div>
            <h1>XML Sitemap</h1>
            <p>noveliotech.com</p>
          </div>
          <span class="badge">
            <xsl:value-of select="count(sm:urlset/sm:url)"/> URLs
          </span>
        </header>

        <main>
          <!-- Core pages -->
          <div class="section-title">Core Pages</div>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Freq</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url[not(contains(sm:loc,'services/')) and not(contains(sm:loc,'/blog/'))]">
                <xsl:sort select="sm:priority" order="descending" data-type="number"/>
                <tr>
                  <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
                  <td class="date"><xsl:value-of select="sm:lastmod"/></td>
                  <td class="freq"><xsl:value-of select="sm:changefreq"/></td>
                  <td>
                    <xsl:call-template name="priority-badge">
                      <xsl:with-param name="p" select="sm:priority"/>
                    </xsl:call-template>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <!-- Service pages -->
          <div class="section-title">Service Pages</div>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Freq</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url[contains(sm:loc,'services/')]">
                <tr>
                  <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
                  <td class="date"><xsl:value-of select="sm:lastmod"/></td>
                  <td class="freq"><xsl:value-of select="sm:changefreq"/></td>
                  <td>
                    <xsl:call-template name="priority-badge">
                      <xsl:with-param name="p" select="sm:priority"/>
                    </xsl:call-template>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <!-- Blog posts -->
          <div class="section-title">Blog Posts</div>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Freq</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url[contains(sm:loc,'/blog/')]">
                <xsl:sort select="sm:lastmod" order="descending"/>
                <tr>
                  <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
                  <td class="date"><xsl:value-of select="sm:lastmod"/></td>
                  <td class="freq"><xsl:value-of select="sm:changefreq"/></td>
                  <td>
                    <xsl:call-template name="priority-badge">
                      <xsl:with-param name="p" select="sm:priority"/>
                    </xsl:call-template>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <footer>
            Generated by Novelio Technologies ·
            <a href="https://www.sitemaps.org" target="_blank" rel="noopener">sitemaps.org protocol</a>
          </footer>
        </main>
      </body>
    </html>
  </xsl:template>

  <!-- Priority badge helper -->
  <xsl:template name="priority-badge">
    <xsl:param name="p"/>
    <xsl:choose>
      <xsl:when test="number($p) >= 0.9">
        <span class="priority p-high"><xsl:value-of select="$p"/></span>
      </xsl:when>
      <xsl:when test="number($p) >= 0.7">
        <span class="priority p-mid"><xsl:value-of select="$p"/></span>
      </xsl:when>
      <xsl:otherwise>
        <span class="priority p-low"><xsl:value-of select="$p"/></span>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>

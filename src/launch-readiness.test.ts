/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PRODUCTION_URL = "https://encore-c6m.pages.dev";

function readProjectFile(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

describe("launch readiness", () => {
  it("declara canonical e metadados completos para compartilhamento", () => {
    const html = readProjectFile("index.html");

    expect(html).toContain(`rel="canonical" href="${PRODUCTION_URL}/"`);
    expect(html).toContain('property="og:type" content="website"');
    expect(html).toContain(`property="og:url" content="${PRODUCTION_URL}/"`);
    expect(html).toMatch(
      new RegExp(
        `property="og:image"\\s+content="${PRODUCTION_URL}/og-image\\.png"`,
      ),
    );
    expect(html).toContain('property="og:image:width" content="1200"');
    expect(html).toContain('property="og:image:height" content="630"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });

  it("oferece instruções de indexação e sitemap para as rotas públicas", () => {
    const robots = readProjectFile("public/robots.txt");
    const sitemap = readProjectFile("public/sitemap.xml");

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain(`Sitemap: ${PRODUCTION_URL}/sitemap.xml`);
    expect(sitemap).toContain(`<loc>${PRODUCTION_URL}/</loc>`);
    expect(sitemap).toContain(`<loc>${PRODUCTION_URL}/chat</loc>`);
  });

  it("define headers de segurança e cache imutável para assets versionados", () => {
    const headers = readProjectFile("public/_headers");

    expect(headers).toContain("Content-Security-Policy:");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("X-Frame-Options: DENY");
    expect(headers).toContain("Permissions-Policy:");
    expect(headers).toContain("Strict-Transport-Security:");
    expect(headers).toMatch(
      /\/assets\/\*\s+Cache-Control: public, max-age=31536000, immutable/,
    );
  });

  it("publica uma imagem social PNG de 1200 por 630 pixels", () => {
    const image = readFileSync(
      new URL("../public/og-image.png", import.meta.url),
    );

    expect(image.subarray(1, 4).toString()).toBe("PNG");
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });
});

const siteUrl = "https://www.pennedit.in";

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [`${siteUrl}/serverSitemap.xml`],
  },
};

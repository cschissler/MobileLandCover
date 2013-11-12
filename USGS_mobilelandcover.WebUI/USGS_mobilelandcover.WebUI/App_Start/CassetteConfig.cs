using Cassette;
using Cassette.Scripts;
using Cassette.Stylesheets;

namespace USGS_mobilelandcover.WebUI
{
  /// <summary>
  /// Configures the Cassette asset bundles for the web application.
  /// </summary>
  public class CassetteBundleConfiguration : IConfiguration<BundleCollection>
  {
    public void Configure(BundleCollection bundles)
    {

      bundles.Add<ScriptBundle>("scripts", new[] 
      {
        "jquery-2.0.3.js",
        "bootstrap.js",
        "leaflet-0.6.2.js",
        "leaflet-gps.js",
        "leaflet.functionaltilelayer.js",
        "map.js"
      });

      bundles.Add<StylesheetBundle>("content", new[]
      {
        "bootstrap/bootstrap.css",
        "bootstrap/bootstrap-theme.css",
        "leaflet.css",
        "footer.css",
        "map.css"
      });
    }
  }
}
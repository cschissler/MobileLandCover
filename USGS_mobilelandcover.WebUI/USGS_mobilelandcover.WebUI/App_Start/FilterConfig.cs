using System.Web;
using System.Web.Mvc;

namespace USGS_mobilelandcover.WebUI
{
  public class FilterConfig
  {
    public static void RegisterGlobalFilters(GlobalFilterCollection filters)
    {
      filters.Add(new HandleErrorAttribute());
    }
  }
}
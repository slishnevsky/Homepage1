using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;
using System.Xml;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Homepage.Controllers
{
    [ApiController]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        [Route("api/news")]
        public IEnumerable<SyndicationItem> GetNews(string source)
        {
            var feed = SyndicationFeed.Load(XmlReader.Create(source));
            return feed.Items;
        }

        [HttpGet]
        [Route("api/weather")]
        public IEnumerable<Forecast> GetWeather()
        {
            var items = new List<Forecast>();
            var html = "https://weather.gc.ca/city/pages/on-143_metric_e.html";
            HtmlWeb web = new HtmlWeb();
            var htmlDoc = web.Load(html);
            var divs = htmlDoc.DocumentNode.SelectNodes("//*[@id='mainContent']/section[2]/details/div[1]/div");

            foreach (var div in divs)
            {
                var item = new Forecast();
                var isFirst = divs.IndexOf(div) == 0;

                var day = div.SelectSingleNode("div[1]");
                if (string.IsNullOrWhiteSpace(day.InnerHtml)) continue;
                var img = isFirst ? div.SelectSingleNode("a/div/img") : div.SelectSingleNode("div[2]/img");
                img.Attributes["width"].Remove(); img.Attributes["height"].Remove(); img.Attributes["class"].Remove();
                img.Attributes["src"].Value = img.Attributes["src"].Value.Insert(0, "https://weather.gc.ca");
                var temperature = isFirst ? div.SelectSingleNode("a/div/p[1]") : div.SelectSingleNode("div[2]/p[1]");
                var conditions = isFirst ? div.SelectSingleNode("a/div/p[3]") : div.SelectSingleNode("div[2]/p[3]");

                item.Day = day.InnerText.Replace("\n", string.Empty).Substring(0, 3);
                item.Image = img.OuterHtml.Replace("\n", string.Empty);
                item.Temperature = temperature.InnerText.Replace("\n", string.Empty).Split("°C")[0] + "°C";
                item.Condition = conditions.InnerText.Replace("\n", string.Empty);
                items.Add(item);
            }
            return items;
        }
    }

    public class Forecast
    {
        public string Day { get; set; }
        public string Image { get; set; }
        public string Temperature { get; set; }
        public string Condition { get; set; }
    }
}

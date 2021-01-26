using LiteDB;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPush;

namespace PWASample.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublisherController : ControllerBase
    {
        private readonly LiteDatabase _db;
        const string PushSubscriberName = "PushSubscriber";
        public PublisherController(ILiteDbContext dbContext)
        {
            _db = dbContext.Database;
        }

        [HttpGet()]
        [HttpHead]
        public ActionResult Get()
        {
            var result = "";
            try
            {
                var subject = @"mailto:rainmaker_ho@gss.com.tw";
                var publicKey = @"BLhYVuGAKX2B7YAYZm4ZnCWkdxb3bz0hUldJ4kCl6pBLxBlrWeKRB-OJJ-b1IZXOmF83twBz8svJVwJmFNfwaH4";
                var privateKey = @"1prKXHYvYSIaWmsZ1Yv3KldSKIaBKwwIWudu1_p7Ig0";
                var vapidDetails = new VapidDetails(subject, publicKey, privateKey);
                var webPushClient = new WebPushClient();
                var subscribers = _db.GetCollection<PushSubscriberVM>(PushSubscriberName).FindAll();
                foreach(var subscriber in subscribers)
                {
                    var subscription = new PushSubscription(subscriber.endpoint
                        , subscriber.keys.p256dh, subscriber.keys.auth);
                    try
                    {
                        webPushClient.SendNotification(subscription, "payload", vapidDetails);
                    }
                    catch (WebPushException exception)
                    {
                        Console.WriteLine("Http STATUS code" + exception.StatusCode);
                    }
                }
            }catch (Exception ex)
            {
                result = ex.ToString();
            }
            
            return Ok(result);
        }

        [HttpOptions]
        public IActionResult GetOptions()
        {
            Response.Headers.Add("Allow", "GET,OPTIONS,POST,DELETE");
            return Ok();
        }
    }
}

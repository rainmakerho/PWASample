using LiteDB;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PWASample.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PushSubscriberController : ControllerBase
    {
        private readonly LiteDatabase _db;
        const string PushSubscriberName = "PushSubscriber";
        public PushSubscriberController(ILiteDbContext dbContext)
        {
            _db = dbContext.Database;
        }

        [HttpPost]
        public ActionResult Post(PushSubscriberVM sub)
        {
            //Sets or Creates a Table in DB
            var subscribers = _db.GetCollection<PushSubscriberVM>(PushSubscriberName);
            subscribers.Insert(sub);
            return Ok();
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(string id)
        {
            var subscribers = _db.GetCollection<PushSubscriberVM>(PushSubscriberName);
            var effectCount = subscribers.DeleteMany(s => s.keys.auth == id);
            if (effectCount > 0)
                return Ok();
            else
                return NotFound();
        }

        [HttpOptions]
        public IActionResult GetOptions()
        {
            Response.Headers.Add("Allow", "GET,OPTIONS,POST,DELETE");
            return Ok();
        }

    }
}

public class PushSubscriberVM
{
    public string endpoint { get; set; }
    public object expirationTime { get; set; }
    public Keys keys { get; set; }
}

public class Keys
{
    public string p256dh { get; set; }
    public string auth { get; set; }
}


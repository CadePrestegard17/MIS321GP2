using Microsoft.AspNetCore.Mvc;

namespace FoodFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet("ping")]
        public ActionResult<string> Ping()
        {
            return Ok("TestController is working!");
        }
    }
}

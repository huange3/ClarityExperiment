using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;

namespace Clarity.Controllers
{
    public class SettingsController : Controller
    {
        // GET: Settings
        public void Get()
        {
            string currJSON = "";
            string filePath = Server.MapPath("~/Shared/settings.json");
            
            Response.ContentType = "application/json";

            try
            {
                if (System.IO.File.Exists(filePath))
                {
                    StreamReader reader = new StreamReader(filePath);

                    using (reader)
                    {
                        currJSON = reader.ReadToEnd();
                    }
                }

                if (currJSON == "")
                {
                    currJSON = "{error: \"Missing settings.json file.\"}";
                }
                
                Response.Write(currJSON);
            }
            catch (Exception e)
            {
                currJSON = "{error: \"Error occurred while loading settings JSON: " + e.Message + "\"}";
                Response.Write(currJSON);
            }
        }
    }
}
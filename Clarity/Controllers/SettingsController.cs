using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Clarity.Shared;

namespace Clarity.Controllers
{
    public class SettingsController : Controller
    {
        // GET: Settings
        public void Load()
        {
            var currJSON = "";
            var filePath = Server.MapPath(Constants.filePathSettings);

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

                if (currJSON == "") currJSON = Functions.writeError("Missing settings.json file.");

                Response.ContentType = "application/json";
                Response.Write(currJSON);
            }
            catch (Exception e)
            {
                currJSON = Functions.writeError("Error occurred while loading settings JSON: " + e.Message);
                Response.ContentType = "application/json";
                Response.Write(currJSON);
            }
        }

        public void Save()
        {
            var currJSON = "";
            var filePath = Server.MapPath(Constants.filePathSettings);

            try
            {
                currJSON = readRequestStream();

                if (currJSON != "")
                {
                    StreamWriter writer = new StreamWriter(filePath, false);

                    using (writer)
                    {
                        writer.WriteLine(currJSON);
                    }

                    currJSON = Functions.writeSuccess("Settings saved successfully!");
                }
                else
                {
                    currJSON = Functions.writeError("Invalid JSON received. Please try again.");
                }

                Response.ContentType = "application/json";
                Response.Write(currJSON);
            }
            catch (Exception e)
            {
                currJSON = Functions.writeError("Error occurred while saving settings JSON: " + e.Message);
                Response.Write(currJSON);
            }
        }

        public string readRequestStream()
        {
            var currData = "";

            if (Request.ContentLength > 0)
            {
                using (StreamReader reader = new StreamReader(Request.InputStream))
                {
                    currData = reader.ReadToEnd();
                }
            }
            return currData;
        }
    }
}
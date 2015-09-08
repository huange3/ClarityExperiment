using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
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
            var returnVal = "";
            StreamWriter writer = null;

            try
            {
                currJSON = readRequestStream();

                if (currJSON != "")
                {
                    writer = new StreamWriter(filePath, false);

                    using (writer)
                    {
                        writer.WriteLine(currJSON);
                    }

                    returnVal = "Settings saved successfully!";
                }
                else
                {
                    returnVal = "Invalid JSON received. Please try again.";
                }

                Response.Write(returnVal);
            }
            catch (Exception e)
            {
                returnVal = "Error occurred while saving settings JSON: " + e.Message;
                Response.Write(returnVal);
            }
            finally
            {
                writer = null;
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
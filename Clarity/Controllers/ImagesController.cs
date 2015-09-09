using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Clarity.Shared;

namespace Clarity.Controllers
{
    public class ImagesController : Controller
    {
        // GET: Images
        public void Load(int catID)
        {
            string[] imageFiles;
            var filePath = "";
            var folderName = "";
            JavaScriptSerializer js = new JavaScriptSerializer();

            try
            {
                if (catID <= 0) catID = (int)Constants.Folders.Animals;

                folderName = Enum.GetName(typeof(Constants.Folders), catID);
                filePath = Server.MapPath(Constants.filePathImages) + "/" + folderName;

                imageFiles = Directory.GetFiles(filePath)
                    .Select(path => Path.GetFileName(path)).ToArray();

                for(int i=0; i < imageFiles.Length; i++)
                {
                    imageFiles[i] = Constants.filePathImages + "/" + folderName + "/" + imageFiles[i];
                }

                Response.ContentType = "application/json";
                Response.Write(js.Serialize(imageFiles));
            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                Response.ContentType = "application/json";
                Response.Write(Functions.writeError("Error occurred while loading images: " + e.Message));
            }
            finally
            {
                imageFiles = null;
                js = null;
            }
        }
    }
}
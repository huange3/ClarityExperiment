using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using System.Web.Script.Serialization;
using Clarity.Shared;

namespace Clarity.Controllers
{
    public class ImagesController : Controller
    {
        // GET: Images
        public void Load(int catID)
        {
            string[] imageFiles;
            string filePath = "";
            JavaScriptSerializer js = new JavaScriptSerializer();

            try
            {
                if (catID <= 0) catID = (int)Constants.Folders.Animals;

                filePath = "~/Images/" + Enum.GetName(typeof(Constants.Folders), catID);

                imageFiles = Directory.GetFiles(filePath);

                Response.ContentType = "application/json";
                Response.Write(js.Serialize(imageFiles));
            }
            catch (Exception e)
            {
                Response.StatusCode = 500;
                Response.Write("Error occurred while loading images: " + e.Message);
            }
            finally
            {
                imageFiles = null;
                js = null;
            }
        }
    }
}
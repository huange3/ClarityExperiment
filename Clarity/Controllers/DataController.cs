using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Web.Mvc;
using Clarity.Shared;
using System.Data;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Globalization;

namespace Clarity.Controllers
{
    public class DataController : Controller
    {
        // GET: Data
        public void Load()
        {
            var currJSON = "";
            var filePath = Server.MapPath(Constants.filePathData);
            DirectoryInfo info = null;
            FileInfo[] files = null;
            List<DataFile> dataFiles = new List<DataFile>();
            DataFile dataFile = null;

            try
            {
                info = new DirectoryInfo(filePath);
                // just get the text files and order by creation date
                files = info.GetFiles("*.txt").OrderByDescending(f => f.CreationTime).ToArray();

                if (files.Length <= 0)
                {
                    currJSON = Functions.writeError("No data files found.");
                    Response.ContentType = "application/json";
                    Response.Write(currJSON);
                    return;
                }

                foreach(FileInfo currFile in files)
                {
                    dataFile = new DataFile();
                    dataFile.FileName = currFile.Name;
                    dataFile.FilePath = currFile.FullName;
                    dataFile.FileExtension = currFile.Extension;
                    dataFile.FileCreationDtm = currFile.CreationTime.ToString("g", CultureInfo.CreateSpecificCulture("en-us"));

                    dataFiles.Add(dataFile);
                }

                currJSON = JsonConvert.SerializeObject(dataFiles);
                Response.ContentType = "application/json";
                Response.Write(currJSON);
            }
            catch (Exception e)
            {
                currJSON = Functions.writeError("Error occurred while loading data: " + e.Message);
                Response.ContentType = "application/json";
                Response.Write(currJSON);             
            }
            finally
            {
                info = null;
                files = null;
                dataFile = null;
                dataFiles = null;
            }
        }

        // save the JSON to App_Data
        // then deserialize the JSON into a delimited file and save it to App_Data
        public void Save()
        {
            var currJSON = "";
            var returnVal = "";            
            var currID = "";
            string fileBody = "";
            string fileName = "";

            JObject dataObj = null;
            JObject summaryObj = null;
            JArray trials = null;
            JArray components = null;
            StreamWriter writer = null;

            try
            {
                currJSON = readRequestStream();

                if (currJSON != "")
                {
                    dataObj = JObject.Parse(currJSON);

                    summaryObj = (JObject)dataObj["summary"];
                    components = (JArray)summaryObj["components"];
                    trials = (JArray)dataObj["trials"];

                    currID = (string)summaryObj["participantID"];

                    // save a copy of the JSON to App_Data
                    fileName = Server.MapPath(Constants.filePathData) + "/" + DateTime.Today.ToString("yyyyMMdd") + "-" + currID + ".json";
                    using (writer = new StreamWriter(fileName))
                    {
                        writer.WriteLine(currJSON);
                    }

                    // start writing/formatting our file body
                    // begin with the summary section
                    fileBody += "Date\t" + DateTime.Today.ToString("MM-dd-yyyy") + "\n";
                    fileBody += "Participant ID\t" + summaryObj["participantID"] + "\n";
                    fileBody += "Category ID\t" + summaryObj["categoryID"] + "\n";
                    fileBody += "Clarity Reward\t" + summaryObj["clarityReward"] + "\n";
                    fileBody += "Trials per Component\t" + summaryObj["numTrials"] + "\n";
                    fileBody += "Trial Duration\t" + summaryObj["trialDuration"] + "\n";
                    fileBody += "Components\t";

                    for (var i = 0; i < components.Count; i++)
                    {
                        fileBody += components[i].ToString() + "\t";
                    }

                    fileBody += "\n\n";

                    // now for the actual trials
                    for (var i = 0; i < trials.Count; i++)
                    {
                        if (i == 0)
                        {
                            fileBody += "Clarity Punish\tButton A Count\tButton A Rate\tButton N Count\tButton N Rate\n";
                        }

                        fileBody += trials[i]["clarityPunish"] + "\t";
                        fileBody += trials[i]["buttonACnt"] + "\t";
                        fileBody += trials[i]["buttonARate"] + "\t";
                        fileBody += trials[i]["buttonNCnt"] + "\t";
                        fileBody += trials[i]["buttonNRate"] + "\t";
                        fileBody += "\n";
                    }

                    // write to App_Data
                    fileName = Server.MapPath(Constants.filePathData) + "/" + DateTime.Today.ToString("yyyyMMdd") + "-" + currID + ".txt";
                    using(writer = new StreamWriter(fileName))
                    {
                        writer.WriteLine(fileBody);
                    }

                    returnVal = "Data saved successfully!";
                }
                else
                {
                    returnVal = "Invalid JSON data received. Please try again.";
                }

                Response.Write(returnVal);
            }
            catch (Exception e)
            {
                returnVal = "Error occurred while saving data: " + e.Message;
                Response.Write(returnVal);
            }
            finally
            {
                writer = null;
                dataObj = null;
                summaryObj = null;
                trials = null;
                components = null;
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

    public class DataFile
    {
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileExtension { get; set; }
        public string FileCreationDtm { get; set; }
    }
}
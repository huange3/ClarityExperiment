using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Clarity.Shared
{
    public static class Functions
    {
        public static string writeError(string str)
        {
            Dictionary<String, String> error = new Dictionary<string, string>
            {
                {"error", str }
            };

            return JsonConvert.SerializeObject(error);
        }

        public static string writeSuccess(string str)
        {
            Dictionary<String, String> success = new Dictionary<string, string>
            {
                {"success", str }
            };

            return JsonConvert.SerializeObject(success);
        }
    }
}
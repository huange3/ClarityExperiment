using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Clarity.Shared
{
    public static class Functions
    {
        public static string writeSuccess(string str)
        {
            return "{success: \"" + str + "\"}";
        }

        public static string writeError(string str)
        {
            return "{error: \"" + str + "\"}";
        }
    }
}
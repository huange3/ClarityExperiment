using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Clarity.Shared
{
    public static class Constants
    {
        public const string filePathSettings = "../Shared/settings.json";
        public const string filePathImages = "../Images";

        public enum Folders
        {
            Animals = 1,
            RealEstate = 2,
            Sports = 3,
            Nature = 4,
            FunnyQuotes = 5,
            Celebrities = 6,
            Food = 7
        }
    }
}
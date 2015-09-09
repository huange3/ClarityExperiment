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
        public const string filePathData = "../Data";

        public enum Folders
        {
            Animals = 1,
            Celebrities = 2,
            Food = 3,
            Nature = 4,
            RealEstate = 5,
            Sports = 6,
            Tattoos = 7
        }
    }
}
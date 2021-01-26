using LiteDB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PWASample
{
    public class LiteDbContext : ILiteDbContext
    {
        public LiteDatabase Database { get; }

        public LiteDbContext(string dbLocation)
        {
            Database = new LiteDatabase(dbLocation);
        }
    }

    public interface ILiteDbContext
    {
        LiteDatabase Database { get; }
    }
}

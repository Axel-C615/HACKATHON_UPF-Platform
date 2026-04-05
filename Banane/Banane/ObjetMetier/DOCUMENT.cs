using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class DOCUMENT
    {
            [Key]
            public int IdDocument { get; set; }
            
            public int IdMatiere_fk_Document { get; set; }

            [ForeignKey(nameof(IdMatiere_fk_Document))]
            public MATIERE DocumentMatiere { get; set; }
 
            public string UrlDocument { get; set; }
            public string TypeDocument { get; set; }
        public DOCUMENT()
        {

        }
        public DOCUMENT(int IdMatiere_fk_Document, string UrlDocument, string TypeDocument)
            {
                this.IdMatiere_fk_Document = IdMatiere_fk_Document;
                this.UrlDocument = UrlDocument;
                this.TypeDocument = TypeDocument;
        }
    }
}

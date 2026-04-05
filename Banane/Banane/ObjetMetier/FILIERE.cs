using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class FILIERE
    {

        [Key]
        public int IdFiliere { get; set; }
        
        public string? Code  { get; set; }
        public string? Nom   { get; set; }
        
        public ICollection<NIVEAUSCOLAIRE> NiveauxScolaires { get; set; } = new List<NIVEAUSCOLAIRE>();

        public FILIERE()
        {

        }
        public FILIERE(string Code, string Nom)
        {
            this.Code = Code;
            this.Nom = Nom;
        }

    }
}

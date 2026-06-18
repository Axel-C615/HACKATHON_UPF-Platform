using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class ABSENCE
    {
        [Key]
        public int IdAbsence { get; set; }
        public int IdEtudiant_fk_Absence { get; set; }
        

        public DateTime DateAbsence { get; set; }
        public int IdMatiere_fk_Absence { get; set; }
        
    }
}

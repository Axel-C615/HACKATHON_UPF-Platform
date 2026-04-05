using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Banane.ObjetMetier;

namespace ApiBanane.ObjetMDTO
{
    public class AbsenceDTO
    {
        [Required]
       
        public int IdEtudiant_fk_Absence { get; set; }

        [Required]
        public DateTime DateAbsence { get; set; }
        [Required]
        public int IdMatiere_fk_Absence { get; set; }
       
    }
}

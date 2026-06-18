using System.ComponentModel.DataAnnotations;

namespace ApiBanane.ObjetMDTO
{
    public class NiveauScolaireDTO
    {

        [Required]
        public string Nom { get; set; } = string.Empty;

        [Required]
        public int IdFiliere_fk_NiveauScol { get; set; }
    }
}

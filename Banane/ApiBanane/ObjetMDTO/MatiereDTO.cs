using System.ComponentModel.DataAnnotations;

namespace ApiBanane.ObjetMDTO
{
    public class MatiereDTO
    {
        [Required]
        public string Titre { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        public int Time { get; set; }

        public string? Jour { get; set; }

        [Required]
        public int IdEnseignant_fk { get; set; }

        [Required]
        public int IdNiveauScolaire_fk_Matiere { get; set; }
    }
}

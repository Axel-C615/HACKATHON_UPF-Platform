using System.ComponentModel.DataAnnotations;

namespace ApiBanane.ObjetMDTO
{
    public class EtudiantDTO
    {
        [Required]
        public string Nom { get; set; }
        [Required]
        public string Prenom { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Matricule { get; set; }
        [Required]
        public int IdFiliere { get; set; }

        /// <summary>Niveau scolaire (optionnel mais recommandé pour lier l’étudiant à une année).</summary>
        public int? IdNiveauScolaire { get; set; }
    }
}

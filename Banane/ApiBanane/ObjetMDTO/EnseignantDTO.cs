using System.ComponentModel.DataAnnotations;

namespace ApiBanane.ObjetMDTO
{
    public class EnseignantDTO
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
    }
}

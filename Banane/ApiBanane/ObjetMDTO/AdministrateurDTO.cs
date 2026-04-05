using System.ComponentModel.DataAnnotations;

namespace ApiBanane.ObjetMDTO
{
    public class AdministrateurDTO
    {
        [Required]
        public string Nom { get; set; }
        [Required]
        public string Prenom { get; set; }
       
       [Required]
       [EmailAddress]  
       public string Email { get; set; }


    }
}

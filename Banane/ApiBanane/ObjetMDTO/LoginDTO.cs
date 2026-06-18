using System.ComponentModel.DataAnnotations;

namespace ApiBanane.ObjetMDTO
{
    public class LoginDTO
    {
        
            [Required]
            [EmailAddress] 
            public string Email { get; set; }

            [Required]
            [StringLength(100, MinimumLength = 2)]  
            public string Password { get; set; }

      
    }
}

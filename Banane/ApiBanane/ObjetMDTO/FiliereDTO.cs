using System.ComponentModel.DataAnnotations;

namespace ApiBanane.ObjetMDTO
{
    public class FiliereDTO
    {

        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        public string Nom { get; set; } = string.Empty;
    }
}

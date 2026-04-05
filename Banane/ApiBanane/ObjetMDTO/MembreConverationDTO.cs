using System.ComponentModel.DataAnnotations;

namespace ApiBanane.ObjetMDTO
{
    public class MembreConverationDTO
    {

        [Required]
        public int IdMembre_fk_MembreC { get; set; }

        [Required]
        public int IdConversation_fk_MembreC { get; set; }

        public string Role { get; set; } = "membre";

        public bool Createur { get; set; } = false;
    }
}

using System.ComponentModel.DataAnnotations;

namespace ApiBanane.ObjetMDTO
{
    public class MessageDTO
    {
        [Required]
        [MaxLength(1000)]
        public string Contenu { get; set; } = string.Empty;

        [Required]
        public int IdExpediteur_fk { get; set; }

        [Required]
        public int IdConversation_fk_Message { get; set; }
    }
}

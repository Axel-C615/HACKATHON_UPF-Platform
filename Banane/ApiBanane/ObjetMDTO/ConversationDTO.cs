

using System;
using System.ComponentModel.DataAnnotations;
namespace ApiBanane.ObjetMDTO
{
    

    public class ConversationDTO
    {
        public string? Nom { get; set; }

        [Required]
        public string TypeConversation { get; set; } = string.Empty;

        [Required]
        public int IdCreateur { get; set; }
    }
}

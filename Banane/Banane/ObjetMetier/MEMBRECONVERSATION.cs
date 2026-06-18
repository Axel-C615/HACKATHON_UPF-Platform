using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class MEMBRECONVERSATION
    {

        [Key]
        public int IdMembreGroupe { get; set; }
        
        public int IdMembre_fk_MembreC { get; set; }
        [ForeignKey(nameof(IdMembre_fk_MembreC))]
        public UTILISATEUR Membre { get; set; }

        public int IdConversation_fk_MembreC { get; set; }
        [ForeignKey(nameof(IdConversation_fk_MembreC))]
        public CONVERSATION Groupe { get; set; }
        public string Role { get; set; } //admin ou membre
        public bool createur { get; set; }

        public MEMBRECONVERSATION() { }


       
        public MEMBRECONVERSATION(int userId, string role = "membre", bool isCreateur = false)
        {
            IdMembre_fk_MembreC = userId;
            Role = role;
            createur = isCreateur;
        }

    }
}

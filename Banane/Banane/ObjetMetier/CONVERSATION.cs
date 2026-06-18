using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class CONVERSATION
    {
        [Key]
        public int IdConversation { get; set; }
        public string? Nom { get; set; }
       
        public DateTime DateCreation { get; set; }
        
        public ICollection<MEMBRECONVERSATION> Membres { get; set; } = new List<MEMBRECONVERSATION>();
        public ICollection<MESSAGE> Messages { get; set; } = new List<MESSAGE>();
        public string TypeConversation { get; set; }


       
        public CONVERSATION()
        {
            Membres = new List<MEMBRECONVERSATION>();
            Messages = new List<MESSAGE>();
            DateCreation = DateTime.Now;
        }
        public CONVERSATION(string typeConveration, string? nom, int createurId)
        {
            TypeConversation = typeConveration;
            Nom = nom;
            DateCreation = DateTime.Now;

            Membres = new List<MEMBRECONVERSATION>();
            Messages = new List<MESSAGE>();

            
            Membres.Add(new MEMBRECONVERSATION
            {
                IdMembre_fk_MembreC = createurId,
                Role = "admin",
                createur = true
            });
        }
    }
}

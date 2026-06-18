using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public  class MESSAGE
    {

        [Key]
        public int IdMessage { get; set; }
        public string Contenu { get; set; }
        public DateTime DateEnvoi { get; set; }
        public int IdExpediteur_fk { get; set; }
        [ForeignKey(nameof(IdExpediteur_fk))]
        public UTILISATEUR Expediteur { get; set; }
        
        public int IdConversation_fk_Message { get; set; }
        [ForeignKey(nameof(IdConversation_fk_Message))]
        public CONVERSATION conversation { get; set; }

        public MESSAGE()
        {
            DateEnvoi = DateTime.Now;
        }

        public MESSAGE(string contenu, int expediteurId, int conversationId)
        {
            Contenu = contenu;
            IdExpediteur_fk = expediteurId;
            IdConversation_fk_Message = conversationId;
            DateEnvoi = DateTime.Now;
        }
    }
}

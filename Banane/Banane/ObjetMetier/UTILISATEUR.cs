using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class UTILISATEUR
    {



        [Key]
        public int IdUtilisateur { get; set; }
            public string Nom { get; set; }
            public string Prenom { get; set; }
            public string Email { get; set; }
            public string MotDePasse { get; set; }
            public DateOnly?  DateNaissance  { get; set; }
        public string? photoUrl { get; set; }


        public string? NumeroTelephone { get; set; }
            public string? Role { get;set; }
        public ICollection<MEMBRECONVERSATION> Conversations { get; set; } = new List<MEMBRECONVERSATION>();//Liste des Conversoations auxquelles l'utilisateur participe


        public UTILISATEUR()
        {
            
        }
        public UTILISATEUR(string Nom, string Prenom, string Email,string MotDePasse)
        {
            this.Nom = Nom;
            this.Prenom = Prenom;
            this.Email = Email;
            this.MotDePasse = MotDePasse;

        }

    }

    
}

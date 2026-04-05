using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class ADMINISTRATEUR : UTILISATEUR
    {

        public ADMINISTRATEUR()
        {
        }
        public ADMINISTRATEUR(string Nom, string Prenom, string Email, string MotDePasse)
            : base(Nom, Prenom, Email, MotDePasse)
        {
            this.Role = "Administrateur";

        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class ENSEIGNANT : UTILISATEUR
    {
        public string? Matricule { get; set; }
        public  ICollection<MATIERE> Matiere_Enseigner{ get; set; } = new List<MATIERE>();


        public ENSEIGNANT()
        {
        }
        public ENSEIGNANT(string Nom, string Prenom, string Email, string MotDePasse, string Matricule)
            : base(Nom, Prenom, Email, MotDePasse)
        {
            this.Matricule = Matricule;
            this.Role = "Enseignant";
        }
    }
}

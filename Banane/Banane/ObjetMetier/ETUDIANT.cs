using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class ETUDIANT : UTILISATEUR
    {
        public string Matricule { get; set; }
        public int?  Filiere { get; set; }
       
       
        
        public int? IdNiveauScolaire_fk_Etudiant { get; set; }
        [ForeignKey(nameof(IdNiveauScolaire_fk_Etudiant))]
        public NIVEAUSCOLAIRE? NiveauScolaire { get; set; }

        public ETUDIANT()
        {

        }
        public ETUDIANT(string Nom, string Prenom, string Email, string MotDePasse, string Matricule)
            : base(Nom, Prenom, Email, MotDePasse)
        {
            this.Matricule = Matricule;
            this.Role = "Etudiant";

        }
    }
}

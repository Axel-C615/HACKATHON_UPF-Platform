using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;

namespace Banane.ObjetMetier
{
    public class MATIERE
    {

        [Key]
        public int IdMatiere { get; set; }
        public string Titre { get; set; }
        public string Code { get; set; }
        public int? Time { get; set; }
        public string? Jour { get; set; }

        public int? IdEnseignant_fk { get; set; }
        [ForeignKey(nameof(IdEnseignant_fk))]
        public ENSEIGNANT Enseignant { get; set; }
        public int? IdNiveauScolaire_fk_Matiere { get; set; }
        [ForeignKey(nameof(IdNiveauScolaire_fk_Matiere))]
        public NIVEAUSCOLAIRE NiveauScolaire { get; set; }

        public MATIERE()
        {
        }
        public MATIERE(string Titre, string Code, int IdEnseignant_fk, int IdNiveauScolaire_fk_Matiere)
        {
            this.Titre = Titre;
            this.Code = Code;
            this.IdEnseignant_fk = IdEnseignant_fk;
            this.IdNiveauScolaire_fk_Matiere = IdNiveauScolaire_fk_Matiere;
        }

    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Banane.ObjetMetier
{
    public class NIVEAUSCOLAIRE
    {

        [Key]
        public int IdNiveauScolaire { get; set; }
        public string Nom { get; set; }
        public ICollection<ETUDIANT> Etudiants { get; set; } = new List<ETUDIANT>();

        public ICollection<MATIERE> Matieres { get; set; } = new List<MATIERE>();
        public int IdFiliere_fk_NiveauScol { get; set; }

        /// <summary>
        /// Non sérialisé en JSON : évite la boucle Filière → NiveauxScolaires → Filière (JsonException / profondeur max).
        /// L’API expose déjà <see cref="IdFiliere_fk_NiveauScol"/> pour le front.
        /// </summary>
        [ForeignKey(nameof(IdFiliere_fk_NiveauScol))]
        [JsonIgnore]
        public FILIERE? Filiere { get; set; }

        public NIVEAUSCOLAIRE()
        {
        }
        public NIVEAUSCOLAIRE(string Nom, int IdFiliere_fk_NiveauScol)
        {
            this.Nom = Nom;
            this.IdFiliere_fk_NiveauScol = IdFiliere_fk_NiveauScol;
        }

    }
}

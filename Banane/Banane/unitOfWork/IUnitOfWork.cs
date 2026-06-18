using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Banane.ObjetMetier;
using Banane.ObjetService;


namespace Banane.unitOfWork
{
    public interface IUnitOfWork: IDisposable
    {

        IRepositoryService<ADMINISTRATEUR> Adminisrateurs { get; }
        IRepositoryService<CONVERSATION> Conversations { get; }
        IRepositoryService<DOCUMENT> Documents { get; }
        IRepositoryService<ENSEIGNANT> Enseignants { get; }
        IRepositoryService<ETUDIANT> Etudiants { get; }
        IRepositoryService<FILIERE> Filieres { get; }
        IRepositoryService<MATIERE> Matieres { get; }
        IRepositoryService<MEMBRECONVERSATION> Membre_Conversations { get; }
        IRepositoryService<UTILISATEUR> Utilisateurs { get; }

        IRepositoryService<NIVEAUSCOLAIRE> Niveau_Scolaires { get; }


        /// Applique en une seule transaction toutes les opérations en attente sur le contexte.
        /// </summary>
        Task<int> CommitAsync();
    }
}

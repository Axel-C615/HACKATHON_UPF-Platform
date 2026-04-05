using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.DataObject;

using Banane.ObjetMetier;
using Banane.ObjetService;
using Microsoft.EntityFrameworkCore;

namespace Banane.unitOfWork
{
    public  class UnitOfWork : IUnitOfWork
    {
        private readonly CreateTable _context;
        public IRepositoryService<ADMINISTRATEUR> Adminisrateurs { get; }
        public IRepositoryService<CONVERSATION> Conversations { get; }
        public IRepositoryService<DOCUMENT> Documents { get; }
        public IRepositoryService<ENSEIGNANT> Enseignants { get; }
        public IRepositoryService<ETUDIANT> Etudiants { get; }
        
        public IRepositoryService<MATIERE> Matieres { get; }
        public IRepositoryService<MEMBRECONVERSATION> Membre_Conversations { get; }
        public IRepositoryService<UTILISATEUR> Utilisateurs { get; }
        public IRepositoryService<MESSAGE> Messages { get; }
        public IRepositoryService<NIVEAUSCOLAIRE> Niveau_Scolaires { get; }
        public IRepositoryService<FILIERE> Filieres { get; }
        

        public UnitOfWork(CreateTable context)
        {
            _context = context;
            // Instanciation de chaque repository avec le même DbContext

            Adminisrateurs = new RepositoryService<ADMINISTRATEUR>(_context);
            Conversations = new RepositoryService<CONVERSATION>(_context);
            Documents = new RepositoryService<DOCUMENT>(_context);
            Enseignants = new RepositoryService<ENSEIGNANT>(_context);
            Etudiants = new RepositoryService<ETUDIANT>(_context);
            Filieres = new RepositoryService<FILIERE>(_context);
            Matieres = new RepositoryService<MATIERE>(_context);
            Membre_Conversations = new RepositoryService<MEMBRECONVERSATION>(_context);
            Utilisateurs = new RepositoryService<UTILISATEUR>(_context);
            Niveau_Scolaires = new RepositoryService<NIVEAUSCOLAIRE>(_context);
            Messages = new RepositoryService<MESSAGE>(_context);

        }


        public async Task<int> CommitAsync()
        {
            // Sauvegarde toutes les modifications effectuées via les repositories
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            // Libère le DbContext
            _context.Dispose();
        }
    }
}

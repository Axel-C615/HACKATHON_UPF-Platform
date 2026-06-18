using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;
using Microsoft.EntityFrameworkCore;

namespace Banane.ObjetService
{
    public class NIVEAUSCOLAIREservice
    {
        private readonly IRepositoryService<NIVEAUSCOLAIRE> _NiveauScolaire;
        private readonly IRepositoryService<ETUDIANT> _Etudiant;

        public NIVEAUSCOLAIREservice(IRepositoryService<NIVEAUSCOLAIRE> NiveauxScolaires,
            IRepositoryService<ETUDIANT> Etudiant)
        {
            _NiveauScolaire = NiveauxScolaires;
            _Etudiant = Etudiant;
        }

        
        public async Task<NIVEAUSCOLAIRE> CreateNIVEAUSCOLAIREAsync(NIVEAUSCOLAIRE newNiveauScolaire)
        {
            

            // Ajoute le niveau scolaire au contexte EF
            await _NiveauScolaire.AddAsync(newNiveauScolaire);
            // Persiste les changements en base
            await _NiveauScolaire.SaveChangesAsync();

            return newNiveauScolaire;
        }

        public async Task<NIVEAUSCOLAIRE?> GetNIVEAUSCOLAIREByIdAsync(int id)
        {
            return await _NiveauScolaire.GetByIdAsync(id);
        }

        public async Task<IEnumerable<NIVEAUSCOLAIRE>> GetAllNIVEAUSCOLAIREAsync()
        {
            return await _NiveauScolaire.ListAsync();
        }

        public async Task UpdateNIVEAUSCOLAIREAsync(NIVEAUSCOLAIRE NiveauScolaire)
        {
            // Indique à EF que l'entité a été modifiée
            _NiveauScolaire.Update(NiveauScolaire);
            // Persiste les modifications
            await _NiveauScolaire.SaveChangesAsync();
        }

        public async Task<NIVEAUSCOLAIRE?> DeleteNIVEAUSCOLAIREAsync(int id)
        {
            var existing = await _NiveauScolaire.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Niveau scolaire avec ID {id} introuvable.");

            // Marque pour suppression
            _NiveauScolaire.Delete(existing);
            // Applique la suppression en base
            await _NiveauScolaire.SaveChangesAsync();

            return existing;
        }

        //Ajouter Plusieur Etudiant à un Niveau Scolaire

        public async Task<NIVEAUSCOLAIRE?> AddEtudiantsToNiveauAsync(int niveauId, List<int> etudiantsIds)
        {
            var niveau = await _NiveauScolaire.Query()
                .Include(n => n.Etudiants)
                .FirstOrDefaultAsync(n => n.IdNiveauScolaire == niveauId);

            if (niveau == null)
                throw new KeyNotFoundException("Niveau introuvable");

            // récupérer les étudiants
            var etudiants = await _Etudiant.Query()
                .Where(e => etudiantsIds.Contains(e.IdUtilisateur))
                .ToListAsync();

            if (!etudiants.Any())
                throw new Exception("Aucun étudiant trouvé");

            foreach (var etudiant in etudiants)
            {
                // éviter doublons
                if (!niveau.Etudiants.Any(e => e.IdUtilisateur == etudiant.IdUtilisateur))
                {
                    // mettre à jour la FK pour le niveau
                    etudiant.IdNiveauScolaire_fk_Etudiant = niveauId;
                    niveau.Etudiants.Add(etudiant);
                }
            }

            await _NiveauScolaire.SaveChangesAsync();
            return niveau;
        }
        public async Task<NIVEAUSCOLAIRE?> RemoveEtudiantsFromNiveauAsync(int niveauId, List<int> etudiantsIds)
        {
            var niveau = await _NiveauScolaire.Query()
                .Include(n => n.Etudiants)
                .FirstOrDefaultAsync(n => n.IdNiveauScolaire == niveauId);

            if (niveau == null)
                throw new KeyNotFoundException("Niveau introuvable");

            var etudiantsToRemove = niveau.Etudiants
                .Where(e => etudiantsIds.Contains(e.IdUtilisateur))
                .ToList();

            foreach (var etudiant in etudiantsToRemove)
            {
                // retirer de la collection et remettre la FK à 0 ou null
                niveau.Etudiants.Remove(etudiant);
                etudiant.IdNiveauScolaire_fk_Etudiant = 0; // ou null si nullable
            }

            await _NiveauScolaire.SaveChangesAsync();
            return niveau;
        }

    }
}

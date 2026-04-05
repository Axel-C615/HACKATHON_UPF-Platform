using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;

namespace Banane.ObjetService
{
    public class FILIEREservice
    {
        private readonly IRepositoryService<FILIERE> _Filiere;
        private readonly IRepositoryService<NIVEAUSCOLAIRE> _NiveauScolaire;

        public FILIEREservice(IRepositoryService<FILIERE> Filieres, IRepositoryService<NIVEAUSCOLAIRE> NiveauScolaires)
        {
            _Filiere = Filieres;
            _NiveauScolaire = NiveauScolaires;
        }

        // Vérification s'il existe une FILIERE avec les mêmes attributs
        public async Task<bool> FILIEREexistsAsync(FILIERE Filiere)
        {
            var existingFiliere = await _Filiere.GetByConditionAsync
                (f => f.Code == Filiere.Code ||  f.Nom == Filiere.Code);

            return existingFiliere.Any(); // RETOURNE UN BOOL T ou F
        }

        public async Task<FILIERE> CreateFILIEREAsync(FILIERE newFiliere)
        {
            if (await FILIEREexistsAsync(newFiliere))
            {
                throw new Exception($"Ce code de filière : {newFiliere.Code} ou {newFiliere.Nom} existe déjà.");
            }

            // Ajoute la filière au contexte EF
            await _Filiere.AddAsync(newFiliere);
            // Persiste les changements en base
            await _Filiere.SaveChangesAsync();

            return newFiliere;
        }

        public async Task<FILIERE?> GetFILIEREByIdAsync(int id)
        {
            return await _Filiere.GetByIdAsync(id);
        }
        
        public async Task<FILIERE?> AddNiveauxScolairesToFiliereAsync(int idFiliere, List<int> niveauxIds)
        {
            var filiere = await _Filiere.GetByIdAsync(idFiliere);

            if (filiere == null)
                throw new KeyNotFoundException($"Filière avec ID {idFiliere} introuvable.");

            foreach (var niveauId in niveauxIds)
            {
                var niveau = await _NiveauScolaire.GetByIdAsync(niveauId);

                if (niveau == null)
                    throw new KeyNotFoundException($"Niveau Scolaire avec ID {niveauId} introuvable.");

                // éviter les doublons
                if (!filiere.NiveauxScolaires.Any(n => n.IdNiveauScolaire == niveauId))
                {
                    filiere.NiveauxScolaires.Add(niveau);
                }
            }

            return filiere;
        }

        public async Task<FILIERE?> RemoveNiveauFromFiliereAsync(int idFiliere, int niveauId)
        {
            var filiere = await _Filiere.GetByIdAsync(idFiliere);

            if (filiere == null)
                throw new KeyNotFoundException($"Filière avec ID {idFiliere} introuvable.");

            var niveau = filiere.NiveauxScolaires
                .FirstOrDefault(n => n.IdNiveauScolaire == niveauId);

            if (niveau == null)
                throw new KeyNotFoundException($"Niveau {niveauId} non associé à cette filière.");

            filiere.NiveauxScolaires.Remove(niveau);

            await _Filiere.SaveChangesAsync();

            return filiere;
        }

        public async Task<FILIERE?> RemoveNiveauxFromFilieresAsync(int idFiliere, List<int> niveauxIds)
        {
            var filiere = await _Filiere.GetByIdAsync(idFiliere);

            if (filiere == null)
                throw new KeyNotFoundException($"Filière avec ID {idFiliere} introuvable.");

            var niveauxToRemove = filiere.NiveauxScolaires
                .Where(n => niveauxIds.Contains(n.IdNiveauScolaire))
                .ToList();

            if (!niveauxToRemove.Any())
                throw new KeyNotFoundException("Aucun niveau correspondant trouvé dans cette filière.");

            foreach (var niveau in niveauxToRemove)
            {
                filiere.NiveauxScolaires.Remove(niveau);
            }

            await _Filiere.SaveChangesAsync();

            return filiere;
        }
        public async Task<IEnumerable<FILIERE>> GetAllFILIEREAsync()
        {
            // Pas d’Include : évite graphe Filière ↔ Niveaux (boucles JSON, réponses énormes).
            return await _Filiere.ListAsync();
        }

        public async Task UpdateFILIEREAsync(FILIERE Filiere)
        {
            // Indique à EF que l'entité a été modifiée
            _Filiere.Update(Filiere);
            // Persiste les modifications
            await _Filiere.SaveChangesAsync();
        }
        public async Task<FILIERE?> PatchFiliereAsync(int id, Dictionary<string, object> changes)
        {
            var Filiere = await _Filiere.GetByIdAsync(id);
            if (Filiere == null) return null;

            foreach (var (key, value) in changes)
            {
                switch (key.ToLowerInvariant())
                {
                    case "nom":
                        Filiere.Nom = value?.ToString();
                        break;
                    case "code":
                        Filiere.Code = value?.ToString();
                        break;
                    
                }
            }

            await _Filiere.SaveChangesAsync();
            return Filiere;
        }

        public async Task<FILIERE?> DeleteFILIEREAsync(int id)
        {
            var existing = await _Filiere.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Filière avec ID {id} introuvable.");

            // Marque pour suppression
            _Filiere.Delete(existing);
            // Applique la suppression en base
            await _Filiere.SaveChangesAsync();

            return existing;
        }
    }
}

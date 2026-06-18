using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;

namespace Banane.ObjetService
{
    public class DOCUMENTservice
    {
        private readonly IRepositoryService<DOCUMENT> _Document;

        public DOCUMENTservice(IRepositoryService<DOCUMENT> Documents)
        {
            _Document = Documents;
        }

       

        public async Task<DOCUMENT> CreateDOCUMENTAsync(DOCUMENT newDocument)
        {
            

            // Ajoute le document au contexte EF
            await _Document.AddAsync(newDocument);
            // Persiste les changements en base
            await _Document.SaveChangesAsync();

            return newDocument;
        }

        public async Task<DOCUMENT?> GetDOCUMENTByIdAsync(int id)
        {
            return await _Document.GetByIdAsync(id);
        }

        public async Task<IEnumerable<DOCUMENT>> GetAllDOCUMENTAsync()
        {
            return await _Document.ListAsync();
        }

        public async Task UpdateDOCUMENTAsync(DOCUMENT Document)
        {
            // Indique à EF que l'entité a été modifiée
            _Document.Update(Document);
            // Persiste les modifications
            await _Document.SaveChangesAsync();
        }

        public async Task<DOCUMENT?> DeleteDOCUMENTAsync(int id)
        {
            var existing = await _Document.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException($"Document avec ID {id} introuvable.");

            // Marque pour suppression
            _Document.Delete(existing);
            // Applique la suppression en base
            await _Document.SaveChangesAsync();

            return existing;
        }
    }
}

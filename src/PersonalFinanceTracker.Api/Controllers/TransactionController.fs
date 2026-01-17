namespace PersonalFinanceTracker.Api.Controllers

open System
open System.Threading.Tasks
open Microsoft.AspNetCore.Mvc
open Microsoft.Extensions.Logging
open PersonalFinanceTracker.Domain
open PersonalFinanceTracker.Data.Repositories

// Response DTO
[<CLIMutable>]
type TransactionDto = {
    Id: Guid
    AccountId: Guid
    Amount: decimal
    TransactionType: string
    Category: string
    Description: string
    Date: DateTime
    CreatedAt: DateTime
}

// Request DTO (Nullable/Optional handling implicit by omission in JSON -> Default values)
// Using a Class with default values can be safer for binding in some scenarios, 
// but CLIMutable Record with default is fine if we don't enforce "Required".
// However, to be safe, let's explicitly define what we expect from client.
[<CLIMutable>]
type CreateTransactionRequest = {
    AccountId: Guid
    Amount: decimal
    TransactionType: string
    Category: string
    Description: string
    Date: DateTime
}

module Mappers =
    let toDto (t: Transaction) : TransactionDto =
        let catString = 
            match t.Category with
            | Other s -> $"Other: {s}"
            | c -> string c
        
        {
            Id = t.Id
            AccountId = t.AccountId
            Amount = t.Amount
            TransactionType = string t.TransactionType
            Category = catString
            Description = t.Description
            Date = t.Date
            CreatedAt = t.CreatedAt
        }

    let fromRequest (req: CreateTransactionRequest) : Transaction =
        let cat = 
            match req.Category with
            | "Groceries" -> Groceries
            | "Utilities" -> Utilities
            | "Rent" -> Rent
            | "Entertainment" -> Entertainment
            | "Transport" -> Transport
            | s when s.StartsWith "Other" -> Other (s.Replace("Other: ", "").Trim())
            | s -> Other s // Fallback
        
        let tType = 
            match req.TransactionType with
            | "Income" -> Income
            | _ -> Expense // Default

        {
            Id = Guid.NewGuid()
            AccountId = req.AccountId
            Amount = req.Amount
            TransactionType = tType
            Category = cat
            Description = req.Description
            Date = req.Date
            CreatedAt = DateTime.UtcNow
        }

[<ApiController>]
[<Route("[controller]")>]
type TransactionController (logger: ILogger<TransactionController>, repo: ITransactionRepository) =
    inherit ControllerBase()

    [<HttpGet>]
    member this.Get() =
        task {
            let! transactions = repo.GetAll()
            let dtos = transactions |> Seq.map Mappers.toDto
            return this.Ok(dtos)
        }

    [<HttpPost>]
    member this.Post([<FromBody>] req: CreateTransactionRequest) =
        task {
            // Map Request to Domain
            let txn = Mappers.fromRequest req
            
            do! repo.Create txn
            
            // Return DTO
            return this.Created($"/transaction/{txn.Id}", Mappers.toDto txn)
        }

    [<HttpDelete("{id}")>]
    member this.Delete(id: Guid) =
        task {
            do! repo.Delete(id)
            return this.NoContent()
        }

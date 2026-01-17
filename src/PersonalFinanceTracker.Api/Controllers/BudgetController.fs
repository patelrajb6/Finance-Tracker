namespace PersonalFinanceTracker.Api.Controllers

open System
open System.Threading.Tasks
open Microsoft.AspNetCore.Mvc
open Microsoft.Extensions.Logging
open PersonalFinanceTracker.Domain
open PersonalFinanceTracker.Data.Repositories

[<CLIMutable>]
type BudgetDto = {
    Id: Guid
    Category: string
    Amount: decimal
    Month: int
    Year: int
}

[<CLIMutable>]
type SetBudgetRequest = {
    Category: string
    Amount: decimal
    Month: int
    Year: int
}

module BudgetMappers =
    let toDto (b: Budget) : BudgetDto =
        let catString = 
            match b.Category with
            | Other s -> $"Other: {s}"
            | c -> string c
            
        {
            Id = b.Id
            Category = catString
            Amount = b.Amount
            Month = b.Month
            Year = b.Year
        }

    let fromRequest (req: SetBudgetRequest) : Budget =
        let cat = 
            match req.Category with
            | "Groceries" -> Groceries
            | "Utilities" -> Utilities
            | "Rent" -> Rent
            | "Entertainment" -> Entertainment
            | "Transport" -> Transport
            | s when s.StartsWith "Other" -> Other (s.Replace("Other: ", "").Trim())
            | s -> Other s

        {
            Id = Guid.NewGuid()
            Category = cat
            Amount = req.Amount
            Month = req.Month
            Year = req.Year
        }

[<ApiController>]
[<Route("[controller]")>]
type BudgetController (logger: ILogger<BudgetController>, repo: IBudgetRepository) =
    inherit ControllerBase()

    [<HttpGet>]
    member this.Get() =
        task {
            let! budgets = repo.GetAllBudgets()
            let dtos = budgets |> Seq.map BudgetMappers.toDto
            return this.Ok(dtos)
        }

    [<HttpPost>]
    member this.Post([<FromBody>] req: SetBudgetRequest) =
        task {
            let budget = BudgetMappers.fromRequest req
            do! repo.SaveBudget budget
            return this.Ok(BudgetMappers.toDto budget)
        }

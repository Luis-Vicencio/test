#include <iostream>
#include <string>

using namespace std;

//defining max num of entries of user
const int max_entries = 100;

class Btool // short for budgeting tool
{
    protected:
        double savings; //user deposit or savings
        string categories[max_entries]; // categories array limited by max_entries
        double e_amount[max_entries]; //$ amount for catergories creating multi dimesnsional array
        int Ecount; // # of entries user puts in

    public:
    // constructor to initialize user savings and their entries
     Btool(double initial_savings) : savings(initial_savings), Ecount (0) {}

    //virtual functions for inhertiance
    virtual void Add_ent(string category, double amount) = 0;
    virtual void calculate_Savings() = 0;
    virtual void Show_Budget_Report () = 0;

    // restriction for user input
    double restrictinput()
        {
            double input;
            while(true)
            {
               cin >> input;
               if(!cin.fail()) //for valid user input
               {
                return input; // retunr the valid input
               }
               else {
                cout << "Invalid input. PLease enter a valid number: ";
                cin.clear();
                cin.ignore(10000, '\n');
               }
            }
        }
    bool rest_entry()//restricts entry
        {
            if (Ecount >= max_entries)
                {
                    cout << "You have reached the maximum number of entries allowed: " << max_entries << endl;
                    return false; 
                }
            return true;
        }

}; // end of parent or base class

//derivied class for montly budgetiing
class B_Monthly : public Btool
{
    public:
        B_Monthly (double inital_savings) : Btool(inital_savings) {} // constructor for montly budget

        void Add_ent(string category, double amount) override // for user to add income or expense
            {
                if (!rest_entry())
                    {
                        return;  //retrict entry limit
                    }
                    categories[Ecount] = category; //stors name of cat add by user
                    e_amount[Ecount]  = amount; // stores the amount of category
                    ++Ecount;
            }
        
        //calculates savings from income or expenses
        void calculate_Savings() override   
            {
                for(int i = 0; i < Ecount; i++)
                    {
                        savings += e_amount[i]; // adds or subtracts from user savings known as "savings"
                    }
            }

        //display for monthly report
        void Show_Budget_Report() override 
            {
                cout << "-----------------------------\n";
                cout << " Monthly Budget Report\n";
                cout << "-----------------------------\n";
                for (int i = 0; i < Ecount; i++) // loop to print user entries with their name and money worth
                    {
                        cout << categories[i] << ": $" << e_amount[i] << endl;
                    }
                cout << "-----------------------------\n";
                cout << "Final Savings: $" << savings << endl; // shows final savings
                cout << "-----------------------------\n";
            }
              
};

class B_yearly : public Btool
{
    public:
        B_yearly (double inital_savings) : Btool(inital_savings) {} // constructor for montly budget

        void Add_ent(string category, double amount) override // for user to add income or expense
            {
                if (!rest_entry())
                    {
                        return;  //retrict entry limit
                    }
                    categories[Ecount] = category; //stors name of cat add by user
                    e_amount[Ecount]  = amount; // stores the amount of category
                    ++Ecount;
            }
        
        //calculates savings from income or expenses
        void calculate_Savings() override   
            {
                for(int k = 0; k < Ecount; k++)
                    {
                        savings += e_amount[k]; // adds or subtracts from user savings known as "savings"
                    }
            }

        //display for monthly report
        void Show_Budget_Report() override 
            {
                cout << "-----------------------------\n";
                cout << " Yearly Budget Report\n";
                cout << "-----------------------------\n";
                for (int k = 0; k < Ecount; k++) // loop to print user entries with their name and money worth
                    {
                        cout << categories[k] << ": $" << e_amount[k] << endl;
                    }
                cout << "-----------------------------\n";
                cout << "Final Savings: $" << savings << endl; // shows final savings
                cout << "-----------------------------\n";
            }
              
};

int main()
{
    double user_savings; // save inital savings
    int user_input; //user input for first menu
    int user_opt; //user input for second menu
    string category; // names of categories
    double amount; // saves amount of said category
    Btool* userpBudget; //our pointer to acces our classes

//first menu page that asks user to decied between yearly or montly
cout << " Hello, Welcome to our budgeting Tool! Please enter one of the following options to proceed...";
cout << endl << "1. Monthly Budget\n";
cout << "2. Yearly Budget\n";
cout << endl << "Now please enter your choice from your keyboard: ";
cin >> user_input;

cout << "Now please enter your inital savinings: $";
user_savings = userpBudget -> restrictinput();


// access the correct derived class depending on user 
if(user_input == 1)
    {
        userpBudget = new B_Monthly(user_savings);
    }
else if (user_input == 2)
    {
        userpBudget = new B_yearly(user_savings);
    }
else
    {
        cout << "Invalid choice. Exiting the program.\n";
        return 0;
    }

// menu
do
{
    cout << "\nBudget Menu:\n";
    cout << "1. Add Income\n";
    cout << "2. Add Expense\n";
    cout << "3. View Report\n";
    cout << "4. Exist the Program\n";
    cin >> user_opt;

switch(user_opt)
    {
case 1: // for income
cout << "Enter income category (ex, 'job paycheck', 'gift'): ";
cin.ignore();
getline(cin, category); //gets category name from user
cout << "Enter expense amount: $";
amount = userpBudget -> restrictinput(); //validate user input
userpBudget -> Add_ent(category, amount);

case 2: // for expenses
cout << "Enter expense category (ex, 'rent', 'groceries'): ";
cin.ignore();
getline(cin, category); //gets category name from user
cout << "Enter expense amount: $";
amount = -userpBudget -> restrictinput(); // validate user input
userpBudget -> Add_ent(category, amount);

//option to display our report
    case 3:
    userpBudget -> calculate_Savings();
    userpBudget -> Show_Budget_Report();
    break;

    case 4: // existing option
        cout << "Existing the program.\n";
        break;

    default: //for invalid options
        cout << "Invalid option. Please choose again.\n";
        break;
    } 
} while (user_opt != 4);

// deleting memory in our pointer
delete userpBudget;
    return 0;
}